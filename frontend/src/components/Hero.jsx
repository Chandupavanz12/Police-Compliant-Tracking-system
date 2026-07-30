import React from 'react';

const Hero = () => {
  return (
    <div className="relative pt-24 pb-16 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      
      {/* Skyline silhouette (placeholder using css gradient for now, can be an svg later) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-[url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10 -z-20 [mask-image:linear-gradient(to_top,black,transparent)]"></div>

      <div className="max-w-4xl mx-auto z-10 glass-effect p-8 md:p-12 rounded-3xl mt-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-sm">
            Smart Policing and Judicial
          </span>
          <br />
          <span className="text-white mt-2 inline-block">
            Tracking System
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
          A unified platform for citizens, police personnel and administration to report, manage and track complaints and judicial cases efficiently.
        </p>

        <div className="mt-10 flex gap-4 justify-center">
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <div className="h-1 w-4 bg-cyan-400 rounded-full opacity-70"></div>
          <div className="h-1 w-4 bg-cyan-400 rounded-full opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
