import { MantineProvider, Container, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { UserCrud } from './components/UserCrud';

const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
});

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} />
      <div className="app-container">
        <Container size="lg" py="xl">
          <UserCrud />
        </Container>
      </div>
    </MantineProvider>
  );
}

export default App;
