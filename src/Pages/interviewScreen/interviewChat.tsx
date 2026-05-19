import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    SafeAreaView, Alert, Platform, PermissionsAndroid,
    ActivityIndicator, ScrollView, NativeModules, NativeEventEmitter,
    Animated, TextInput,
} from 'react-native';
import Tts from 'react-native-tts';

type UIMessage = { role: 'user' | 'ai'; text: string; id: number };
type ChatMsg = { role: string; parts: { text: string }[] };

const GEMINI_KEY = 'AIzaSyAaAEeLz1uJ0qDurbbJDN9_mezrboOiD00';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

// 1. Updated Prompt builder to include experience and company
const buildPrompt = (role: string, experience: string, company: string, skills: string) =>
    `You are a professional interviewer interviewing a candidate for a ${role} role${company ? ` at ${company}` : ' at a top tech company'}.
The candidate has ${experience} of experience.
${skills ? `The candidate has specified these skills: ${skills}. Focus your technical questions around them specifically.` : ''}
STRICT RULES:
- Ask exactly ONE question per turn. Never combine questions.
- First message: "Hello! I am your interviewer. Let's begin. Please introduce yourself briefly."
- After each answer: one sentence feedback + one new question.
- Cover: intro, technical, problem-solving, behavioural, situational.
- After question 9 say: "Thank you so much for your time. This concludes our interview. Best of luck!"
- Speak naturally. Short sentences. Plain text ONLY — no asterisks, bullets, or markdown.
- Never say you are an AI.`;

const PHASES = ['Intro', 'Technical', 'Problem', 'Behaviour', 'Wrap up'];
// Experience options list
const EXP_OPTIONS = ['Junior (0-2 yrs)', 'Mid-level (2-5 yrs)', 'Senior (5+ yrs)'];

export default function InterviewScreen({ navigation }: { navigation: any }) {

    const [screen, setScreen] = useState<'select' | 'ready' | 'interview' | 'done'>('select');
    const [customRole, setCustomRole] = useState('');
    const [customSkills, setCustomSkills] = useState('');
    
    // 2. New State variables for Experience and Company
    const [experience, setExperience] = useState('Mid-level (2-5 yrs)');
    const [customCompany, setCustomCompany] = useState('');
    
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [liveText, setLiveText] = useState('');
    const [textInput, setTextInput] = useState('');
    const [indicator, setIndicator] = useState<'ai' | 'mic' | 'thinking' | 'idle'>('idle');
    const [qNum, setQNum] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const history = useRef<ChatMsg[]>([]);
    const scrollRef = useRef<ScrollView | null>(null);
    const busy = useRef(false);
    const listening = useRef(false);
    const screenRef = useRef('select');
    const ttsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { SpeechModule } = NativeModules;
    useEffect(() => { screenRef.current = screen; }, [screen]);

    useEffect(() => {
        if (indicator === 'mic') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.5, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [indicator]);

    useEffect(() => {
        const initTts = async () => {
            try { await Tts.getInitStatus(); }
            catch (e: any) { if (e.code === 'no_engine') Tts.requestInstallEngine(); }
            Tts.setDefaultLanguage('en-US');
            Tts.setDefaultRate(0.52);
            Tts.setDefaultPitch(1.05);
        };
        initTts();

        const onFinish = () => {
            if (ttsTimer.current) { clearTimeout(ttsTimer.current); ttsTimer.current = null; }
            if (screenRef.current !== 'interview') return;
            busy.current = false;
            setIndicator('idle');
        };
        const onCancel = () => {
            if (ttsTimer.current) { clearTimeout(ttsTimer.current); ttsTimer.current = null; }
            busy.current = false;
            setIndicator('idle');
        };

        Tts.addEventListener('tts-finish', onFinish);
        Tts.addEventListener('tts-cancel', onCancel);
        Tts.addEventListener('tts-error', onCancel);

        return () => {
            Tts.stop();
            stopMic();
            Tts.removeEventListener('tts-finish', onFinish as () => void);
            Tts.removeEventListener('tts-cancel', onCancel as () => void);
            Tts.removeEventListener('tts-error', onCancel as () => void);
        };
    }, []);

    useEffect(() => {
        if (!SpeechModule) return;
        const emitter = new NativeEventEmitter(SpeechModule);

        const onPartial = emitter.addListener('onSpeechPartial', (t: string) => {
            if (listening.current) setLiveText(t);
        });
        const onResult = emitter.addListener('onSpeechResults', (t: string) => {
            listening.current = false;
            setLiveText('');
            setIndicator('thinking');
            if (t?.trim()) { sendAnswer(t.trim()); }
            else { busy.current = false; setTimeout(() => startMic(), 500); }
        });
        const onError = emitter.addListener('onSpeechError', () => {
            listening.current = false;
            setLiveText('');
            if (screenRef.current === 'interview' && !busy.current)
                setTimeout(() => startMic(), 1000);
        });

        return () => { onPartial.remove(); onResult.remove(); onError.remove(); };
    }, []);

    const askMicPermission = async () => {
        if (Platform.OS !== 'android') return true;
        const r = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            { title: 'Microphone', message: 'PrepAI needs mic access.', buttonPositive: 'Allow' },
        );
        return r === PermissionsAndroid.RESULTS.GRANTED;
    };

    const callGemini = async (msgs: ChatMsg[]): Promise<string> => {
        const res = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: msgs,
                generationConfig: { maxOutputTokens: 300, temperature: 0.75 },
            }),
        });
        const d: any = await res.json();
        if (d.error) throw new Error(d.error.message);
        return d.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    };

    const speak = (text: string) => {
        stopMic();
        busy.current = true;
        setIndicator('ai');
        Tts.stop();
        const ms = Math.min(Math.max(text.length * 60, 3000), 20000);
        if (ttsTimer.current) clearTimeout(ttsTimer.current);
        ttsTimer.current = setTimeout(() => {
            if (busy.current && screenRef.current === 'interview') {
                busy.current = false;
                setIndicator('idle');
            }
        }, ms);
        setTimeout(() => Tts.speak(text), 250);
    };

    const startMic = () => {
        if (busy.current || listening.current || !SpeechModule) return;
        if (screenRef.current !== 'interview') return;
        listening.current = true;
        setLiveText('');
        setIndicator('mic');
        SpeechModule.startListening();
    };

    const stopMic = () => {
        if (SpeechModule && listening.current) {
            try { SpeechModule.stopListening(); } catch (_) { }
        }
        listening.current = false;
        setIndicator('idle');
    };

    const addMsg = (role: 'ai' | 'user', text: string) => {
        setMessages(p => [...p, { role, text, id: Date.now() }]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    };

    const beginInterview = async () => {
        const role = customRole.trim();
        const skills = customSkills.trim();
        const comp = customCompany.trim();
        if (!role) { Alert.alert('Enter your role', 'Please type a job role to continue.'); return; }
        const ok = await askMicPermission();
        if (!ok) { Alert.alert('Need mic permission'); return; }

        setScreen('interview');
        setMessages([]);
        setQNum(0);
        history.current = [];
        busy.current = false;
        listening.current = false;
        setIndicator('thinking');

        // 3. Updated initial user context payload
        history.current = [{
            role: 'user',
            parts: [{ text: buildPrompt(role, experience, comp, skills) + '\n\nStart the interview now.' }],
        }];

        try {
            const reply = await callGemini(history.current);
            history.current.push({ role: 'model', parts: [{ text: reply }] });
            addMsg('ai', reply);
            setQNum(1);
            speak(reply);
        } catch (e: any) {
            Alert.alert('Error', e.message);
            setScreen('ready');
        }
    };

    const sendAnswer = async (answer: string) => {
        if (!answer.trim() || busy.current) return;
        busy.current = true;
        addMsg('user', answer);
        setIndicator('thinking');

        history.current.push({
            role: 'user',
            parts: [{ text: `My answer: "${answer}". Give 1 sentence feedback then ask the next question. Plain text only.` }],
        });
        if (history.current.length > 13)
            history.current = [history.current[0], ...history.current.slice(-12)];

        try {
            const reply = await callGemini(history.current);
            history.current.push({ role: 'model', parts: [{ text: reply }] });
            addMsg('ai', reply);
            setQNum(n => {
                const next = n + 1;
                if (next >= 10) setTimeout(() => setScreen('done'), 5000);
                return next;
            });
            speak(reply);
        } catch (e: any) {
            busy.current = false;
            Alert.alert('Error', e.message);
            setTimeout(() => startMic(), 1000);
        }
    };

    const endInterview = () => {
        Tts.stop(); stopMic(); busy.current = false;
        if (ttsTimer.current) { clearTimeout(ttsTimer.current); ttsTimer.current = null; }
        setScreen('done');
    };

    const resetAll = () => {
        setScreen('select'); setMessages([]); setQNum(0);
        setCustomRole(''); setCustomSkills(''); setCustomCompany(''); setExperience('Mid-level (2-5 yrs)');
        history.current = []; busy.current = false; listening.current = false;
    };

    // ── SELECT ────────────────────────────────────────────
    if (screen === 'select') return (
        <SafeAreaView style={s.root}>
            <View style={s.ph}>
                <Text style={s.h1}>Prepare Your Interview</Text>
                <Text style={s.sub}>Tell the AI your target parameters</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Field 1: Job Role */}
                <View>
                    <Text style={s.fieldLabel}>🎯  Job Role *</Text>
                    <Text style={s.fieldHint}>e.g. Frontend Developer, Data Scientist, Product Manager</Text>
                    <View style={[s.fieldBox, customRole.length > 0 && s.fieldBoxActive]}>
                        <TextInput
                            style={s.fieldInput}
                            placeholder="Type your job role..."
                            placeholderTextColor="#3D4060"
                            value={customRole}
                            onChangeText={setCustomRole}
                            returnKeyType="next"
                        />
                        {customRole.length > 0 && (
                            <TouchableOpacity onPress={() => setCustomRole('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={s.clearBtn}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Field 2: Experience Selector */}
                <View>
                    <Text style={s.fieldLabel}>📈  Experience Level</Text>
                    <Text style={s.fieldHint}>Helps tailor the difficulty of technical concepts</Text>
                    <View style={s.expRow}>
                        {EXP_OPTIONS.map((opt) => {
                            const active = experience === opt;
                            return (
                                <TouchableOpacity 
                                    key={opt} 
                                    style={[s.expChip, active && s.expChipActive]}
                                    onPress={() => setExperience(opt)}
                                >
                                    <Text style={[s.expChipTxt, active && s.expChipTxtActive]}>{opt.split(' ')[0]}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Field 3: Target Company (Optional) */}
                <View>
                    <Text style={s.fieldLabel}>🏢  Target Company (Optional)</Text>
                    <Text style={s.fieldHint}>e.g. Google, Stripe, or a generic early stage startup</Text>
                    <View style={[s.fieldBox, customCompany.length > 0 && s.fieldBoxActive]}>
                        <TextInput
                            style={s.fieldInput}
                            placeholder="Type your dream company..."
                            placeholderTextColor="#3D4060"
                            value={customCompany}
                            onChangeText={setCustomCompany}
                            returnKeyType="next"
                        />
                        {customCompany.length > 0 && (
                            <TouchableOpacity onPress={() => setCustomCompany('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={s.clearBtn}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Field 4: Your Skills */}
                <View>
                    <Text style={s.fieldLabel}>⚡  Your Skills</Text>
                    <Text style={s.fieldHint}>e.g. React, Node.js, System Design, Python, AWS</Text>
                    <View style={[s.fieldBox, s.fieldBoxMulti, customSkills.length > 0 && s.fieldBoxActive]}>
                        <TextInput
                            style={[s.fieldInput, { height: 90, textAlignVertical: 'top' }]}
                            placeholder="List your skills, technologies, tools..."
                            placeholderTextColor="#3D4060"
                            value={customSkills}
                            onChangeText={setCustomSkills}
                            returnKeyType="done"
                            multiline
                        />
                    </View>
                </View>

                {/* Dynamic AI Preview Card */}
                {(customRole.trim() || customSkills.trim() || customCompany.trim()) && (
                    <View style={s.previewCard}>
                        <Text style={s.previewTitle}>📋  AI Interview Setup</Text>
                        {customRole.trim() ? (
                            <View style={s.previewRow}>
                                <Text style={s.previewKey}>Role</Text>
                                <Text style={s.previewVal}>{customRole.trim()}</Text>
                            </View>
                        ) : null}
                        <View style={s.previewRow}>
                            <Text style={s.previewKey}>Level</Text>
                            <Text style={s.previewVal}>{experience}</Text>
                        </View>
                        {customCompany.trim() ? (
                            <View style={s.previewRow}>
                                <Text style={s.previewKey}>Target</Text>
                                <Text style={s.previewVal}>{customCompany.trim()}</Text>
                            </View>
                        ) : null}
                        {customSkills.trim() ? (
                            <View style={s.previewRow}>
                                <Text style={s.previewKey}>Skills</Text>
                                <Text style={s.previewVal}>{customSkills.trim()}</Text>
                            </View>
                        ) : null}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                style={[s.btn, !customRole.trim() && s.btnOff]}
                onPress={() => customRole.trim() && setScreen('ready')}
                disabled={!customRole.trim()}
            >
                <Text style={s.btnTxt}>
                    {customRole.trim() ? 'Continue →' : 'Enter your role first'}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );

    // ── READY ─────────────────────────────────────────────
    if (screen === 'ready') return (
        <SafeAreaView style={s.root}>
            <View style={s.center}>
                <Text style={{ fontSize: 62, marginBottom: 14 }}>🎯</Text>
                <Text style={s.h1}>{customRole.trim()}</Text>
                <Text style={[s.sub, {color: '#FF4D00', fontWeight: '600'}]}>
                    {experience} {customCompany.trim() ? `• Interviewing at ${customCompany.trim()}` : ''}
                </Text>
                {customSkills.trim() ? <Text style={s.sub} numberOfLines={2}>{customSkills.trim()}</Text> : null}
                
                <View style={s.infoBox}>
                    {[
                        '🤖  AI speaks every question aloud',
                        '🎙  Mic auto-activates — just speak',
                        '💬  Live transcript shown on screen',
                        '📊  10 questions · real-time feedback',
                    ].map((t, i) => <Text key={i} style={s.infoTxt}>{t}</Text>)}
                </View>
                <TouchableOpacity style={s.btn} onPress={beginInterview}>
                    <Text style={s.btnTxt}>🎙  Begin Interview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.ghost} onPress={() => setScreen('select')}>
                    <Text style={s.ghostTxt}>← Change Setup</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    // ── INTERVIEW ─────────────────────────────────────────
    if (screen === 'interview') return (
        <SafeAreaView style={s.root}>

            <View style={s.header}>
                <View style={{ flex: 1 }}>
                    <Text style={s.hTitle} numberOfLines={1}>🎯  {customRole.trim()}</Text>
                    <Text style={s.hSub}>Question {qNum} / 10</Text>
                </View>
                <TouchableOpacity style={s.endBtn} onPress={endInterview}>
                    <Text style={s.endTxt}>End</Text>
                </TouchableOpacity>
            </View>

            <View style={s.progWrap}>
                <View style={s.progRow}>
                    <Text style={s.progLabel}>Progress</Text>
                    <Text style={s.progPct}>{Math.round((qNum / 10) * 100)}%</Text>
                </View>
                <View style={s.progBar}>
                    <View style={[s.progFill, { width: `${(qNum / 10) * 100}%` as any }]} />
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsScroll}>
                <View style={s.chipsRow}>
                    {PHASES.map((p, i) => {
                        const phaseQ = i * 2;
                        const isDone = qNum > phaseQ + 1;
                        const isNow = qNum >= phaseQ && qNum <= phaseQ + 1;
                        return (
                            <View key={p} style={[s.chip, isDone && s.chipDone, isNow && !isDone && s.chipNow]}>
                                <Text style={[s.chipTxt, isDone && s.chipTxtDone, isNow && !isDone && s.chipTxtNow]}>
                                    {isDone ? '✓ ' : ''}{p}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 14, paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
            >
                {messages.length === 0 && indicator === 'thinking' && (
                    <View style={s.startingBox}>
                        <ActivityIndicator color="#FF4D00" size="small" />
                        <Text style={s.startingTxt}>  Starting interview...</Text>
                    </View>
                )}

                {messages.map(m => (
                    <View key={m.id} style={[s.bubble, m.role === 'user' ? s.bubU : s.bubAI]}>
                        <Text style={s.bubRole}>{m.role === 'ai' ? '🤖 Interviewer' : '👤 You'}</Text>
                        <Text style={m.role === 'ai' ? s.bubTxtAI : s.bubTxtU}>{m.text}</Text>
                    </View>
                ))}

                {indicator === 'thinking' && messages.length > 0 && (
                    <View style={s.thinkRow}>
                        <View style={s.thinkDot} />
                        <View style={[s.thinkDot, { marginLeft: 4 }]} />
                        <View style={[s.thinkDot, { marginLeft: 4 }]} />
                        <Text style={s.thinkTxt}> AI is thinking...</Text>
                    </View>
                )}

            </ScrollView>

            <View style={s.inputBar}>
                {!!liveText && (
                    <View style={s.liveBox}>
                        <Animated.View style={[s.dotGreen, { transform: [{ scale: pulseAnim }], marginRight: 8 }]} />
                        <Text style={s.liveTxt}>{liveText}</Text>
                    </View>
                )}

                <View style={s.inputRow}>
                    <TextInput
                        style={s.answerInput}
                        placeholder={indicator === 'ai' ? 'AI is speaking...' : 'Type your answer...'}
                        placeholderTextColor="#3D4060"
                        value={textInput}
                        onChangeText={setTextInput}
                        editable={indicator !== 'ai'}
                        multiline
                        maxLength={500}
                        returnKeyType="send"
                    />

                    {textInput.trim().length > 0 && (
                        <TouchableOpacity
                            style={s.sendBtn}
                            onPress={() => {
                                const txt = textInput.trim();
                                setTextInput('');
                                sendAnswer(txt);
                            }}
                        >
                            <Text style={s.sendIcon}>➤</Text>
                        </TouchableOpacity>
                    )}

                    {textInput.trim().length === 0 && (
                        <TouchableOpacity
                            style={[s.micBtn, indicator === 'mic' && s.micBtnActive, indicator === 'ai' && s.micBtnDisabled]}
                            onPress={() => {
                                if (indicator === 'ai') return;
                                if (indicator === 'mic') {
                                    stopMic();
                                } else {
                                    startMic();
                                }
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={s.micIcon}>
                                {indicator === 'mic' ? '⏹' : '🎙'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={s.inputStatus}>
                    {indicator === 'ai' && '🔊 AI is speaking...'}
                    {indicator === 'mic' && '🔴 Recording — tap ⏹ to stop'}
                    {indicator === 'thinking' && '⏳ AI is thinking...'}
                    {indicator === 'idle' && '💬 Type or tap 🎙 to speak'}
                </Text>
            </View>

        </SafeAreaView>
    );

    // ── DONE ──────────────────────────────────────────────
    return (
        <SafeAreaView style={[s.root, s.center]}>
            <Text style={{ fontSize: 62, marginBottom: 14 }}>🏆</Text>
            <Text style={s.h1}>Interview Complete!</Text>
            <Text style={s.sub}>
                {customRole.trim()} · {messages.filter(m => m.role === 'user').length} answers given
            </Text>
            <View style={s.statsGrid}>
                <View style={s.statCard}>
                    <Text style={s.statN}>{qNum}</Text>
                    <Text style={s.statL}>Questions</Text>
                </View>
                <View style={s.statCard}>
                    <Text style={[s.statN, { color: '#00E096' }]}>
                        {messages.filter(m => m.role === 'user').length}
                    </Text>
                    <Text style={s.statL}>Answered</Text>
                </View>
                <View style={[s.statCard, { borderColor: 'rgba(255,77,0,0.2)', flexBasis: '100%' }]}>
                    <Text style={s.statN}>AI</Text>
                    <Text style={s.statL}>Personalized feedback after every answer</Text>
                </View>
            </View>
            <TouchableOpacity style={s.btn} onPress={resetAll}>
                <Text style={s.btnTxt}>Try Another Role</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ghost} onPress={() => navigation?.goBack()}>
                <Text style={s.ghostTxt}>← Back to Home</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#080910' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    ph: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 4 },
    h1: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
    sub: { color: '#8A8FA8', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20 },

    fieldLabel: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
    fieldHint: { color: '#5A5F7A', fontSize: 12, marginBottom: 10, lineHeight: 16 },
    fieldBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13151f', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 10 },
    fieldBoxMulti: { alignItems: 'flex-start', paddingTop: 12 },
    fieldBoxActive: { borderColor: '#FF4D00', backgroundColor: 'rgba(255,77,0,0.05)' },
    fieldInput: { flex: 1, color: '#fff', fontSize: 14 },
    clearBtn: { color: '#5A5F7A', fontSize: 18, lineHeight: 22, paddingLeft: 8 },

    // Styles for experience row chips
    expRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
    expChip: { flex: 1, paddingVertical: 12, backgroundColor: '#13151f', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    expChipActive: { borderColor: '#FF4D00', backgroundColor: 'rgba(255,77,0,0.08)' },
    expChipTxt: { color: '#5A5F7A', fontSize: 13, fontWeight: '600' },
    expChipTxtActive: { color: '#FF4D00' },

    previewCard: { backgroundColor: '#13151f', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,77,0,0.2)', gap: 10 },
    previewTitle: { color: '#FF4D00', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
    previewRow: { flexDirection: 'row', gap: 8 },
    previewKey: { color: '#5A5F7A', fontSize: 13, fontWeight: '600', width: 55 },
    previewVal: { color: '#fff', fontSize: 13, flex: 1, lineHeight: 20 },

    btn: { alignSelf: 'center', marginBottom: 12, backgroundColor: '#FF4D00', borderRadius: 50, paddingVertical: 15, alignItems: 'center', width: '90%', shadowColor: '#FF4D00', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
    btnOff: { backgroundColor: '#1e2030', shadowOpacity: 0, elevation: 0 },
    btnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
    ghost: { padding: 14, alignItems: 'center' },
    ghostTxt: { color: '#5A5F7A', fontSize: 13 },

    infoBox: { backgroundColor: '#13151f', borderRadius: 16, padding: 18, width: '100%', marginVertical: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    infoTxt: { color: '#8A8FA8', fontSize: 13, lineHeight: 30 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    hTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
    hSub: { color: '#8A8FA8', fontSize: 11, marginTop: 2 },
    endBtn: { backgroundColor: 'rgba(255,59,92,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,59,92,0.3)' },
    endTxt: { color: '#FF3B5C', fontSize: 12, fontWeight: '700' },

    progWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2 },
    progRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    progLabel: { color: '#8A8FA8', fontSize: 11 },
    progPct: { color: '#FF4D00', fontSize: 11, fontWeight: '600' },
    progBar: { height: 3, backgroundColor: '#1a1c2a', borderRadius: 2 },
    progFill: { height: 3, backgroundColor: '#FF4D00', borderRadius: 2 },

    chipsScroll: { flexGrow: 0, paddingTop: 8 },
    chipsRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingBottom: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#13151f', borderWidth: 1, borderColor: '#1e2030' },
    chipDone: { backgroundColor: 'rgba(255,77,0,0.08)', borderColor: 'rgba(255,77,0,0.3)' },
    chipNow: { backgroundColor: '#FF4D00', borderColor: '#FF4D00' },
    chipTxt: { fontSize: 11, fontWeight: '600', color: '#3D4060' },
    chipTxtDone: { color: '#FF4D00' },
    chipTxtNow: { color: '#fff' },

    bubble: { marginBottom: 12, maxWidth: '88%', borderRadius: 18, padding: 13 },
    bubAI: { backgroundColor: '#13151f', alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,77,0,0.18)', borderBottomLeftRadius: 4 },
    bubU: { backgroundColor: '#1a1c2a', alignSelf: 'flex-end', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderBottomRightRadius: 4 },
    bubRole: { color: '#FF4D00', fontSize: 10, fontWeight: '700', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
    bubTxtAI: { color: '#f0f0f8', fontSize: 14, lineHeight: 22 },
    bubTxtU: { color: '#c0c4e0', fontSize: 14, lineHeight: 22 },

    startingBox: { flexDirection: 'row', alignItems: 'center', padding: 14, alignSelf: 'flex-start' },
    startingTxt: { color: '#FF4D00', fontSize: 13 },

    thinkRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 4, marginBottom: 10 },
    thinkDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF4D00' },
    thinkTxt: { color: '#5A5F7A', fontSize: 12, marginLeft: 4 },

    liveBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1a14', borderWidth: 1, borderColor: 'rgba(0,224,150,0.2)', borderRadius: 14, padding: 12, marginBottom: 8 },
    liveTxt: { color: '#00E096', fontSize: 13, fontStyle: 'italic', flex: 1 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%', marginVertical: 22 },
    statCard: { flex: 1, minWidth: '44%', backgroundColor: '#13151f', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    statN: { fontSize: 26, fontWeight: '800', color: '#FF4D00' },
    statL: { fontSize: 11, color: '#8A8FA8', marginTop: 4, textAlign: 'center' },

    inputBar:       { backgroundColor: '#0d0f1a', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
    inputRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    answerInput:    { flex: 1, backgroundColor: '#13151f', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, lineHeight: 20 },
    inputStatus:    { color: '#3D4060', fontSize: 11, textAlign: 'center', marginTop: 6, height: 16 },

    sendBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF4D00', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF4D00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
    sendIcon:       { color: '#fff', fontSize: 16 },

    micBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: '#13151f', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    micBtnActive:   { backgroundColor: 'rgba(255,59,92,0.15)', borderColor: '#FF3B5C' },
    micBtnDisabled: { opacity: 0.4 },
    micIcon:        { fontSize: 18 },
    // The exact missing item causing your error:
    dotGreen: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00E096',
    },
});