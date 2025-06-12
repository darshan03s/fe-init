import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton";

const Home = () => {
  return (
    <>
      <div className="fixed bottom-4 left-4">
        <DarkModeToggleButton />
      </div>
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen h-full dark:bg-black">
        <h1 className="text-4xl font-bold dark:text-white">Home</h1>
      </div>
    </>
  );
};

export default Home;
