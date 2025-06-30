import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages";
import Layout from "@/components/Layout";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
