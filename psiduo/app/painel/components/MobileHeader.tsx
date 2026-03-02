import React from "react";
import LogoPsiDuo from "@/components/LogoPsiDuo";

export function MobileHeader() {
  return (
    <>
       <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-deep border-b border-white/5 flex items-center justify-between p-4 px-6 shadow-2xl shadow-deep/20 transition-all duration-300 safe-area-top h-20">
           <LogoPsiDuo variant="light" width={110} height={55} />
       </div>
       <div className="md:hidden h-20"></div>
    </>
  );
}

