import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldAlert, ShieldCheck } from 'lucide-react';

const PortalCard = ({ title, description, buttonText, icon: Icon, colorTheme, link }) => {
  const themes = {
    blue: {
      bg: 'bg-blue-500/10',
      iconBg: 'bg-blue-600',
      iconText: 'text-white',
      title: 'text-blue-400',
      btn: 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]',
      border: 'border-blue-500/20 group-hover:border-blue-500/50'
    },
    green: {
      bg: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-600',
      iconText: 'text-white',
      title: 'text-emerald-400',
      btn: 'bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 shadow-[0_0_15px_rgba(5,150,105,0.3)] hover:shadow-[0_0_25px_rgba(5,150,105,0.5)]',
      border: 'border-emerald-500/20 group-hover:border-emerald-500/50'
    },
    purple: {
      bg: 'bg-purple-500/10',
      iconBg: 'bg-purple-600',
      iconText: 'text-white',
      title: 'text-purple-400',
      btn: 'bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]',
      border: 'border-purple-500/20 group-hover:border-purple-500/50'
    }
  };

  const theme = themes[colorTheme];

  return (
    <div className={`group glass-effect rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 border ${theme.border} hover:bg-white/[0.08]`}>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110 ${theme.iconBg}`}>
        <Icon className={`w-10 h-10 ${theme.iconText}`} />
      </div>
      
      <h3 className={`text-2xl font-bold mb-4 ${theme.title}`}>
        {title}
      </h3>
      
      <p className="text-slate-300 mb-8 flex-grow leading-relaxed">
        {description}
      </p>
      
      <Link 
        to={link}
        className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${theme.btn}`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

const PortalSelection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Select Your Portal to Continue
        </h2>
        <p className="text-slate-400 text-lg">
          Choose your designated role to access the specific dashboard features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PortalCard 
          title="Citizen Dashboard"
          description="Register complaints, track status, and get updates on your cases securely."
          buttonText="Go to Citizen Portal →"
          icon={Users}
          colorTheme="blue"
          link="/citizen-login"
        />
        
        <PortalCard 
          title="Police Dashboard"
          description="View assigned complaints, update status and manage investigations effectively."
          buttonText="Go to Police Portal →"
          icon={ShieldAlert}
          colorTheme="green"
          link="/police-login"
        />
        
        <PortalCard 
          title="Admin Dashboard"
          description="Manage users, monitor activities, and oversee the entire system operation."
          buttonText="Go to Admin Portal →"
          icon={ShieldCheck}
          colorTheme="purple"
          link="/admin-login"
        />
      </div>
    </section>
  );
};

export default PortalSelection;
