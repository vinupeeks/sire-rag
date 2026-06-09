import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useDispatch, useSelector } from 'react-redux';

const ChatInput = ({ disabled, onSend }) => {

  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.data.darkMode);

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const [value, setValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  const theme = {
    wrapperStyle: darkMode
      ? 'bg-slate-800/70 border border-slate-700 hover:border-slate-600 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 rounded-2xl transition-all duration-200 shadow-md shadow-black/20'
      : 'bg-white border border-slate-200 hover:border-slate-300 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 rounded-2xl transition-all duration-200 shadow-sm shadow-slate-200/60',

    inputStyle: darkMode
      ? 'bg-transparent border-none text-slate-100 placeholder-slate-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 caret-sky-400'
      : 'bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 caret-sky-500',

    buttonStyle: darkMode
      ? 'border border-sky-400 text-sky-400 hover:bg-sky-400/10 active:bg-sky-400/20 disabled:border-slate-600 disabled:text-slate-600 disabled:cursor-not-allowed rounded-full transition-all duration-150'
      : 'border border-sky-500 text-sky-500 hover:bg-sky-50 active:bg-sky-100 disabled:border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed rounded-full transition-all duration-150',
  };

  return (
    <div className={`flex items-center gap-2 w-full px-3 py-1.5 ${theme.wrapperStyle}`}>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
        placeholder="What would you like to know from your SMS"
        disabled={disabled}
        className={`w-full text-xs sm:text-sm h-10 shadow-none outline-none focus:outline-none ${theme.inputStyle}`}
      />
      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        variant="ghost"
        className={`flex-shrink-0 h-8 px-3.5 text-xs sm:text-sm font-medium flex items-center gap-1.5 bg-transparent border-none ${theme.buttonStyle}`}
      >
        <span>Send</span>
        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default ChatInput;