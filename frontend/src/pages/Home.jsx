import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PortalSelection from '../components/PortalSelection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 flex flex-col font-sans relative overflow-x-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-[#020617] -z-20 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-20 pointer-events-none mix-blend-overlay"></div>
      
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        <Hero />
        <PortalSelection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
