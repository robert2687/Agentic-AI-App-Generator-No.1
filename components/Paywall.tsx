import React from 'react';
import PremiumIcon from './icons/PremiumIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckIcon from './icons/CheckIcon';

interface PaywallProps {
  onGrantPremium: () => void;
  isGranting: boolean;
}

const Paywall: React.FC<PaywallProps> = ({ onGrantPremium, isGranting }) => {
  const features = [
    'Unlimited application generations',
    'Full access to all AI agents',
    'Refinement and debugging cycles',
    'Code deployment instructions',
  ];

  return (
    <div className="bg-surface-dark/70 rounded-lg p-lg flex flex-col gap-6 text-center items-center border border-accent-primary/30 max-w-3xl mx-auto">
      <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center border-4 border-accent-primary/20">
        <PremiumIcon className="w-8 h-8 text-accent-primary" />
      </div>
      
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-text-primary-dark">Unlock Full Access (Free Demo)</h2>
        <p className="text-text-secondary-dark text-base max-w-xl">
          This is a demonstration application. To continue, please activate the premium features. 
          This is completely free and allows you to test the entire workflow.
        </p>
      </div>

      <div className="w-full max-w-md bg-surface-dark p-md rounded-lg border border-border-dark text-left">
        <h3 className="font-semibold text-text-primary-dark mb-sm">Features you'll unlock:</h3>
        <ul className="space-y-2 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckIcon className="w-4 h-4 text-status-success mt-1 flex-shrink-0" />
              <span className="text-text-secondary-dark">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="w-full flex flex-col items-center gap-md">
        <button
            onClick={onGrantPremium}
            disabled={isGranting}
            className="w-full max-w-xs bg-accent-primary text-background-dark font-bold py-2.5 px-6 rounded-md hover:bg-accent-primary-hover transition-colors flex items-center justify-center gap-2 disabled:bg-accent-primary/50 disabled:cursor-wait"
        >
            {isGranting ? <SpinnerIcon className="w-5 h-5" /> : <PremiumIcon className="w-5 h-5" />}
            {isGranting ? 'Activating...' : 'Activate Premium (Free)'}
        </button>
      </div>
      
      <div className="text-xs text-text-tertiary-dark mt-2">
        By activating, you acknowledge that this is a demo and not a real subscription.
      </div>

    </div>
  );
};

export default Paywall;
