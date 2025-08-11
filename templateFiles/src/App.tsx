import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages";
import Layout from "@/components/Layout";

const App = () => {
  return (
    <div className="bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
