import React, { useState, useEffect, useCallback } from 'react';
import { Container, CircularProgress, Alert, AppBar, Toolbar, Typography, Box } from '@mui/material';
import NoteList from './components/NoteList';
import NoteForm from './components/NoteForm';
import SearchBar from './components/SearchBar';
import { Note } from './types/Note';
import { getNotes, createNote, updateNote, deleteNote, searchNotes } from './services/api';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (title: string, content: string) => {
    try {
      setError(null);
      const newNote = await createNote(title, content);
      setNotes(prevNotes => [newNote, ...prevNotes]);
    } catch (err) {
      setError('Failed to create note. Please try again.');
    }
  };

  const handleUpdateNote = async (id: number, title: string, content: string) => {
    try {
      setError(null);
      const updatedNote = await updateNote(id, title, content);
      setNotes(prevNotes =>
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
    } catch (err) {
      setError('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      setError(null);
      await deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (err) {
      setError('Failed to delete note. Please try again.');
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      
      if (query.trim() === '') {
        await fetchNotes();
      } else {
        const results = await searchNotes(query);
        setNotes(results);
      }
    } catch (err) {
      setError('Failed to search notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1">
            Note Manager
          </Typography>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4, 
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <NoteForm onSubmit={handleCreateNote} />
        
        <Box sx={{ my: 2 }}>
          <SearchBar 
            value={searchQuery}
            onChange={handleSearch}
          />
        </Box>

        {loading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flex: 1
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <NoteList
            notes={notes}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        )}
      </Container>
    </Box>
  );
}

export default App;
