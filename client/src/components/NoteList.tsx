import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import NoteItem from './NoteItem';
import { Note } from '../types/Note';

interface NoteListProps {
  notes: Note[];
  onUpdate: (id: number, title: string, content: string) => void;
  onDelete: (id: number) => void;
}

const NoteList: React.FC<NoteListProps> = memo(({ notes, onUpdate, onDelete }) => {
  if (notes.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '200px'
        }}
      >
        <Typography variant="body1" color="textSecondary">
          No notes found. Create one to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <div className="note-list">
      {notes.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

NoteList.displayName = 'NoteList';

export default NoteList; 