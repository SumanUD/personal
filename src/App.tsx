import { BrowserRouter, Route, Routes } from "react-router-dom";
import Workbench from "./ide/Workbench";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="*" element={<Workbench />} />
    </Routes>
  </BrowserRouter>
);

export default App;
