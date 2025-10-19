import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ariaLabel,
  ...rest
}) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    className || ''
  ].filter(Boolean).join(' ');

  if (process.env.NODE_ENV === 'development' && !children && !ariaLabel) {
    // eslint-disable-next-line no-console
    console.warn('Button: provide children or ariaLabel for accessibility');
  }

  return (
    <button
      className={classNames}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
