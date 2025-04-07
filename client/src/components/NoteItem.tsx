import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Dialog, TextField, Button } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Note } from '../types/Note';

interface NoteItemProps {
  note: Note;
  onUpdate: (id: number, title: string, content: string) => void;
  onDelete: (id: number) => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(note.id, editTitle, editContent);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <>
      <Card className="note-item">
        <CardContent>
          <div className="note-item-header">
            <Typography variant="h6">{note.title}</Typography>
            <div>
              <IconButton onClick={() => setIsEditing(true)} size="small">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(note.id)} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
          <Typography className="note-item-content">
            {note.content}
          </Typography>
          <Typography variant="caption" className="timestamp">
            Created: {formatDate(note.created_at)}
            {note.updated_at !== note.created_at && 
              ` • Updated: ${formatDate(note.updated_at)}`}
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit} className="note-form">
          <TextField
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default NoteItem; 