import GoogleLogo from "@/components/svg/GoogleLogo";

const SignInWithGoogleButton = () => {
  return (
    <button className="flex items-center gap-2 py-2 px-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-800 dark:text-white w-[200px]">
      <GoogleLogo className="size-5" />
      Sign In with Google
    </button>
  );
};

export default SignInWithGoogleButton;
