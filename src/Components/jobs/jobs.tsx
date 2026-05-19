// import React, { useEffect, useState } from "react";
// import { Text, View, ScrollView, Dimensions, StyleSheet } from "react-native";

// const {width ,height} =Dimensions.get('window');

// type Job = {
//   id: number;
//   title: string;
// };

// export default function Jobinterview() {
//   const [companies, setCompanies] = useState<Job[]>([]);

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const res = await fetch(
//           "https://remotive.com/api/remote-jobs"
//         );

//         const data = await res.json();

//         console.log("API DATA:", data);

//         setCompanies(data.jobs);
//       } catch (error) {
//         console.log("ERROR:", error);
//       }
//     };

//     fetchJobs();
//   }, []);

//   return (
//     <ScrollView>
//       <View>
//         {companies.map((job) => (
//           <Text 
//           key={job.id}
//           style={styles.joblistTxt}>{job.title}</Text>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// const styles =StyleSheet.create({
//   joblistTxt:{
//     color:'white'
//   }
// })




import React, { useEffect, useState } from "react";
import {
    Text, View, ScrollView, Dimensions, StyleSheet,
    TextInput, TouchableOpacity, Linking, ActivityIndicator,
    SafeAreaView, RefreshControl,
} from "react-native";

const { width, height } = Dimensions.get('window');

type Job = {
    id: number;
    title: string;
    company_name: string;
    candidate_required_location: string;
    job_type: string;
    url: string;
    publication_date: string;
    tags: string[];
};

const jobTypeLabel: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    freelance: 'Freelance',
    internship: 'Internship',
};

const jobTypeColor: Record<string, string> = {
    full_time: 'rgba(52,199,89,0.15)',
    part_time: 'rgba(0,122,255,0.15)',
    contract: 'rgba(255,159,10,0.15)',
    freelance: 'rgba(175,82,222,0.15)',
    internship: 'rgba(90,200,250,0.15)',
};

const jobTypeTxtColor: Record<string, string> = {
    full_time: '#34c759',
    part_time: '#4da3ff',
    contract: '#ff9f0a',
    freelance: '#af52de',
    internship: '#5ac8fa',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export default function Jobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filtered, setFiltered] = useState<Job[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchJobs = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError('');
        try {
            const res = await fetch(
                'https://remotive.com/api/remote-jobs?category=software-dev&limit=30'
            );
            const data = await res.json();
            setJobs(data.jobs);
            setFiltered(data.jobs);
        } catch (e) {
            setError('Failed to load jobs. Check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(jobs);
        } else {
            const q = search.toLowerCase();
            setFiltered(jobs.filter(j =>
                j.title.toLowerCase().includes(q) ||
                j.company_name.toLowerCase().includes(q) ||
                j.tags?.some(t => t.toLowerCase().includes(q))
            ));
        }
    }, [search, jobs]);

    const handleApply = (url: string) => {
        Linking.openURL(url).catch(() => {
            // silently fail
        });
    };

    // ── LOADING ──────────────────────────────────────────
    if (loading) return (
        <SafeAreaView style={styles.root}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Job Opportunities</Text>
                <Text style={styles.headerSub}>Remote software jobs</Text>
            </View>
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#007AFF" size="large" />
                <Text style={styles.loadingTxt}>Fetching latest jobs...</Text>
            </View>
        </SafeAreaView>
    );

    // ── ERROR ────────────────────────────────────────────
    if (error) return (
        <SafeAreaView style={styles.root}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Job Opportunities</Text>
            </View>
            <View style={styles.loadingContainer}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>⚠️</Text>
                <Text style={styles.errorTxt}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => fetchJobs()}>
                    <Text style={styles.retryTxt}>Retry</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.root}>
            {/* header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Job Opportunities</Text>
                    <Text style={styles.headerSub}>{filtered.length} remote jobs found</Text>
                </View>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeTxt}>🌐 Remote</Text>
                </View>
            </View>

            {/* search */}
            <View style={styles.searchRow}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search jobs, companies, skills..."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Text style={styles.clearBtn}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* list */}
            <ScrollView
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchJobs(true)}
                        tintColor="#007AFF"
                        colors={['#007AFF']}
                    />
                }
            >
                {filtered.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>🔎</Text>
                        <Text style={styles.emptyTxt}>No jobs found for "{search}"</Text>
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Text style={styles.clearSearchTxt}>Clear search</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filtered.map((job) => (
                        <View key={job.id} style={styles.card}>
                            {/* company + date */}
                            <View style={styles.cardTop}>
                                <View style={styles.companyLogo}>
                                    <Text style={styles.companyLogoTxt}>
                                        {job.company_name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.companyName} numberOfLines={1}>
                                        {job.company_name}
                                    </Text>
                                    <Text style={styles.dateAgo}>
                                        {timeAgo(job.publication_date)}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.typeBadge,
                                    { backgroundColor: jobTypeColor[job.job_type] || 'rgba(255,255,255,0.08)' }
                                ]}>
                                    <Text style={[
                                        styles.typeTxt,
                                        { color: jobTypeTxtColor[job.job_type] || 'rgba(255,255,255,0.5)' }
                                    ]}>
                                        {jobTypeLabel[job.job_type] || job.job_type}
                                    </Text>
                                </View>
                            </View>

                            {/* title */}
                            <Text style={styles.jobTitle} numberOfLines={2}>
                                {job.title}
                            </Text>

                            {/* location */}
                            {job.candidate_required_location ? (
                                <View style={styles.locationRow}>
                                    <Text style={styles.locationIcon}>📍</Text>
                                    <Text style={styles.locationTxt} numberOfLines={1}>
                                        {job.candidate_required_location}
                                    </Text>
                                </View>
                            ) : null}

                            {/* tags */}
                            {job.tags?.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.tagsScroll}
                                >
                                    <View style={styles.tagsRow}>
                                        {job.tags.slice(0, 5).map((tag, i) => (
                                            <View key={i} style={styles.tag}>
                                                <Text style={styles.tagTxt}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            )}

                            {/* apply button */}
                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => handleApply(job.url)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.applyTxt}>Apply Now →</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                <View style={{ height: height * 0.1 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0b0d12',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.02,
        paddingBottom: height * 0.015,
    },
    headerTitle: {
        fontSize: width * 0.055,
        fontWeight: '700',
        color: '#fff',
    },
    headerSub: {
        fontSize: width * 0.03,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 2,
    },
    headerBadge: {
        backgroundColor: 'rgba(0,122,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(0,122,255,0.3)',
        borderRadius: 20,
        paddingHorizontal: width * 0.03,
        paddingVertical: height * 0.006,
    },
    headerBadgeTxt: {
        fontSize: width * 0.028,
        color: '#4da3ff',
        fontWeight: '600',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        marginHorizontal: width * 0.05,
        marginBottom: height * 0.015,
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.012,
        gap: 8,
    },
    searchIcon: {
        fontSize: width * 0.04,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: width * 0.035,
    },
    clearBtn: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 16,
        paddingLeft: 4,
    },
    list: {
        paddingHorizontal: width * 0.05,
        gap: 12,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: width * 0.045,
        gap: height * 0.01,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.03,
        marginBottom: height * 0.006,
    },
    companyLogo: {
        width: width * 0.1,
        height: width * 0.1,
        borderRadius: width * 0.05,
        backgroundColor: 'rgba(0,122,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(0,122,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyLogoTxt: {
        color: '#4da3ff',
        fontSize: width * 0.045,
        fontWeight: '700',
    },
    companyName: {
        fontSize: width * 0.035,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
    },
    dateAgo: {
        fontSize: width * 0.025,
        color: 'rgba(255,255,255,0.25)',
        marginTop: 2,
    },
    typeBadge: {
        paddingHorizontal: width * 0.025,
        paddingVertical: height * 0.004,
        borderRadius: 20,
    },
    typeTxt: {
        fontSize: width * 0.025,
        fontWeight: '600',
    },
    jobTitle: {
        fontSize: width * 0.042,
        fontWeight: '700',
        color: '#fff',
        lineHeight: width * 0.058,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationIcon: {
        fontSize: width * 0.03,
    },
    locationTxt: {
        fontSize: width * 0.03,
        color: 'rgba(255,255,255,0.35)',
        flex: 1,
    },
    tagsScroll: {
        flexGrow: 0,
        marginTop: height * 0.004,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        paddingHorizontal: width * 0.025,
        paddingVertical: height * 0.004,
    },
    tagTxt: {
        fontSize: width * 0.025,
        color: 'rgba(255,255,255,0.45)',
    },
    applyBtn: {
        backgroundColor: '#007AFF',
        borderRadius: 50,
        paddingVertical: height * 0.014,
        alignItems: 'center',
        marginTop: height * 0.008,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    applyTxt: {
        color: '#fff',
        fontSize: width * 0.035,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingTxt: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: width * 0.035,
    },
    errorTxt: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: width * 0.035,
        textAlign: 'center',
        marginBottom: 8,
    },
    retryBtn: {
        backgroundColor: '#007AFF',
        borderRadius: 50,
        paddingVertical: height * 0.014,
        paddingHorizontal: width * 0.1,
        marginTop: 8,
    },
    retryTxt: {
        color: '#fff',
        fontSize: width * 0.035,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: height * 0.1,
        gap: 8,
    },
    emptyTxt: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: width * 0.035,
        textAlign: 'center',
    },
    clearSearchTxt: {
        color: '#007AFF',
        fontSize: width * 0.035,
        marginTop: 4,
    },
});