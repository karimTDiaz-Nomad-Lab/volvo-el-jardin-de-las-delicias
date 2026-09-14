/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { cn } from '@/shared/lib/utils';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'glass';
export type ButtonSize = 'md' | 'lg' | 'kiosk';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...rest
}) => (
  <button
    type={type}
    className={cn(styles.base, styles[variant], styles[size], className)}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
