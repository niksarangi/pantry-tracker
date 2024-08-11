'use client';  // Add this line at the very top

import '../app/globals.css'; 
import { useState, useEffect } from 'react';
import { Box, Typography, Modal, Stack, TextField, Button, Paper, AppBar, Toolbar } from '@mui/material';
import { collection, query, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from '../firebase';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '../firebaseClient';
import CssBaseline from '@mui/material/CssBaseline';
import RecipeSuggestion from '../app/components/RecipeSuggestion';

// Theme definition with grocery shop theme
const theme = createTheme({
  palette: {
    primary: { main: '#013220' }, // Fresh green for primary elements
    secondary: { main: '#ff9800' }, // Orange for secondary elements
    background: {
      default: '#967969', // Light beige background
    },
  },
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
    h2: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#013220', // Green for headers
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: '500',
      color: '#333',
    },
    button: {
      textTransform: 'none',
      fontWeight: 'bold',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '1rem',
          margin: '1rem',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          padding: '10px 20px',
        },
      },
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

  // Inventory management functions
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">My Pantry</Typography>
        </Toolbar>
      </AppBar>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        paddingTop={5}
        bgcolor={'#fffbe7'} // Light beige for a fresh look
      >
    
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          sx={{
            backgroundColor: '#4caf50',
            ':hover': {
              backgroundColor: '#388e3c',
            },
            marginBottom: '2rem', // Added margin to create space below the button
          }}
        >
          Add New Item
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">Add Item</Typography>
            <Stack width="100%" direction={'row'} spacing={2} marginTop={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
                sx={{
                  backgroundColor: '#4caf50',
                  ':hover': {
                    backgroundColor: '#388e3c',
                  },
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Paper elevation={3}>
          <Box
            width="800px"
            height="80px"
            bgcolor={'#4caf50'} // Green for the header
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant={'h2'} color={'#fff'} textAlign={'center'}>Inventory Items</Typography>
          </Box>
          <Stack width="800px" maxHeight="400px" spacing={2} overflow={'auto'} padding={2}>
            {inventory.map(({ name, quantity }) => (
              <Paper key={name} elevation={1}>
                <Box
                  width="100%"
                  minHeight="50px"
                  display={'flex'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  padding={2}
                >
                  <Typography variant={'h3'} color={'#333'}>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                  <Typography variant={'h3'} color={'#333'}>Quantity: {quantity}</Typography>
                  <Stack direction={'row'} spacing={1}>
                    <Button variant="contained" color="primary" onClick={() => addItem(name)}>Add</Button>
                    <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>Remove</Button>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Paper>
        <Paper elevation={3} style={{ width: '800px', padding: '1rem', marginTop: '1rem' }}>
          <Typography variant={'h2'} color={'#4caf50'} textAlign={'center'} gutterBottom>Recipe Suggestions</Typography>
          <Box maxHeight="200px" overflow="auto" padding="1rem" bgcolor="#f9f9f9">
            <RecipeSuggestion inventory={inventory} />
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
