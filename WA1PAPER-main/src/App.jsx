import GlobalStyles from "./styles/GlobalStyles";
import Router from "./Router"
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import "@fontsource/roboto-slab";
import "@fontsource/im-fell-french-canon-sc";


function App() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <Router />
      <Footer />
    </AuthProvider>
  )
}

export default App