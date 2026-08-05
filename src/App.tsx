import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CustomThemeProvider } from './context/ThemeContext.js';
import { AppRoutes } from './routes/AppRoutes.js';

export default function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </CustomThemeProvider>
  );
}
