import { useState, useCallback } from 'react';

export const useUI = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<number>(1);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'home' | 'audit' | 'preview'>('home');

  const handleSelectAgent = useCallback((agentId: number) => {
    setSelectedAgentId(agentId);
    if (window.innerWidth < 1024) { // Tailwind's lg breakpoint
      setMobileView('audit');
    }
  }, []);

  const resetUI = useCallback(() => {
    setSelectedAgentId(1);
    setShowDeploymentModal(false);
    setMobileView('home');
  }, []);

  return {
    selectedAgentId,
    isZenMode,
    showPreviewModal,
    showDeploymentModal,
    showAuthModal,
    mobileView,
    handleSelectAgent,
    setIsZenMode,
    setShowPreviewModal,
    setShowDeploymentModal,
    setShowAuthModal,
    setMobileView,
    resetUI,
    setSelectedAgentId,
  };
};