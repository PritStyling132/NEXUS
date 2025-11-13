import React from 'react';
import LandingPageNavbar from './_components/navbar';

type Props={
  children:React.ReactNode;
}
const LandingPageLayout:React.FC<Props> =({children})=> {
  return (
    
    <div className="flex flex-col container relative">
    <LandingPageNavbar/> 
    {children}</div>
  )
}


export default LandingPageLayout