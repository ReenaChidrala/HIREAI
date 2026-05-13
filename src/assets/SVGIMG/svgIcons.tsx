import  React  from 'react';
import { SvgXml } from 'react-native-svg';


export const MenuIcon = () => {
    return <SvgXml xml= {`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>`}
    width={40} height={28} color={'white'}  />;
}

export const LeftArrow = () => {
    return <SvgXml xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>`}
    width={20}height={20} color={'black'} />;
    
}

