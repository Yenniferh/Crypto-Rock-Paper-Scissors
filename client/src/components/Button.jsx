const Button = ({ 
  children,
  className,
  onClick,
  disabled,
}) => {
  return (
    <button 
      className={`px-8 py-2 bg-sky-100 rounded-sm text-slate-900 transition-all duration-300 ease-in hover:border hover:border-slate-800 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;