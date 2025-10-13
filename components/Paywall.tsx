import React from 'react';
import PremiumIcon from './icons/PremiumIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckIcon from './icons/CheckIcon';

interface PaywallProps {
  onGrantPremium: () => void;
  isGranting: boolean;
  onRestore: () => void;
  isRestoring: boolean;
  restoreMessage: string | null;
}

const Paywall: React.FC<PaywallProps> = ({ 
  onGrantPremium, 
  isGranting,
  onRestore,
  isRestoring,
  restoreMessage,
}) => {

  const plans = [
    {
      name: 'Monthly',
      price: '$10',
      period: '/ month',
      features: ['Unlimited generations', 'Access to all agents', 'Standard support'],
      popular: false,
    },
    {
      name: 'Annual',
      price: '$100',
      period: '/ year',
      features: ['Unlimited generations', 'Access to all agents', 'Priority support', 'Early access to new features'],
      popular: true,
    },
    {
      name: 'Lifetime',
      price: '$300',
      period: 'one-time',
      features: ['Unlimited generations', 'Access to all agents', 'Lifetime support', 'All future updates included'],
      popular: false,
    },
  ];

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-6 text-center items-center border-2 border-amber-500/30">
      <PremiumIcon className="w-12 h-12 text-amber-400" />
      <h2 className="text-2xl font-bold text-amber-300">Upgrade to Premium</h2>
      <p className="text-slate-400/90 text-sm max-w-lg mt-1">
        Unlock the full power of the AI Agent team with unlimited generations, priority support, and access to all features.
      </p>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-left">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative p-4 rounded-lg border-2 flex flex-col ${plan.popular ? 'border-sky-500 bg-sky-900/20' : 'border-slate-700 bg-slate-800'}`}>
            {plan.popular && (
              <div className="absolute -top-3 right-4 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <h3 className="text-lg font-bold text-slate-100">{plan.name}</h3>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-white">{plan.price}</span>
              <span className="text-slate-400">{plan.period}</span>
            </div>
            <ul className="space-y-2 my-4 text-sm flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckIcon className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button disabled className="w-full mt-auto bg-slate-600 text-slate-400 font-bold py-2 px-4 rounded-md cursor-not-allowed">
              Choose Plan
            </button>
          </div>
        ))}
      </div>
      
      <div className="w-full mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
        <h3 className="font-semibold text-slate-200">For Demonstration Purposes</h3>
         <p className="text-slate-400/90 text-sm max-w-md mt-2 mx-auto">
            This is a demo app. You can grant yourself premium access for free to test the full generation workflow.
        </p>
        <button
            onClick={onGrantPremium}
            disabled={isGranting}
            className="mt-4 w-full max-w-xs mx-auto bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:bg-amber-500/50 disabled:cursor-wait"
        >
            {isGranting ? <SpinnerIcon className="w-5 h-5" /> : <PremiumIcon className="w-5 h-5" />}
            {isGranting ? 'Granting...' : 'Grant Free Premium Access'}
        </button>
      </div>
      
      <div className="text-xs text-slate-500 mt-2 flex flex-col items-center gap-2">
        <button 
          onClick={onRestore}
          disabled={isRestoring}
          className="underline hover:text-slate-400 disabled:text-slate-600 disabled:cursor-wait transition-colors"
        >
          {isRestoring ? 'Checking...' : 'Restore Purchases'}
        </button>
        {restoreMessage && (
            <p className={`mt-1 text-sm ${restoreMessage.startsWith('Error') ? 'text-red-400' : 'text-sky-300'}`}>
              {restoreMessage}
            </p>
        )}
      </div>

    </div>
  );
};

export default Paywall;