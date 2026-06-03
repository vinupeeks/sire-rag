import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const ChatInput = ({ disabled, onSend }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask a question about your documents..."
        disabled={disabled}
        className="text-xs sm:text-sm"
      />
      <Button type="submit" disabled={disabled || !value.trim()} className="w-full px-3 py-2 text-xs sm:w-auto sm:px-4 sm:py-2 sm:text-sm" variant="primary">
        <span className="inline-flex items-center gap-2">
          <span className="hidden sm:inline">Send</span>
          <span className="sm:hidden">Send</span>
          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
      </Button>
    </form>
  );
};

export default ChatInput;
