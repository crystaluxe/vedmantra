export default function Toast({ toast }) {
  if (!toast?.message) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-sm">
      <div
        className={`rounded-[24px] px-4 py-4 shadow-2xl border backdrop-blur-2xl flex items-start gap-3 ${
          isSuccess
            ? "bg-green-50/95 border-green-100 text-green-800"
            : "bg-red-50/95 border-red-100 text-red-700"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
            isSuccess ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isSuccess ? "✓" : "!"}
        </div>

        <div className="flex-1">
          <p className="text-sm font-black">
            {isSuccess ? "Success" : "Something went wrong"}
          </p>

          <p className="text-xs font-semibold mt-1 leading-5 opacity-80">
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}