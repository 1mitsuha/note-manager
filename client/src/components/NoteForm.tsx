import React, { useState } from 'react';
import { Paper, TextField, Button, Box } from '@mui/material';

interface NoteFormProps {
  onSubmit: (title: string, content: string) => void;
}

export const NoteForm: React.FC<NoteFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim());
      setTitle('');
      setContent('');
    }
  };

  return (
    <Paper elevation={2} className="note-form">
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          multiline
          rows={4}
          required
          margin="normal"
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!title.trim() || !content.trim()}
          >
            Add Note
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default NoteForm; 