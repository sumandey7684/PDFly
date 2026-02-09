"use client";

interface ProcessingStatusProps {
  status: "idle" | "processing" | "success" | "error";
  message?: string;
}

export default function ProcessingStatus({
  status,
  message,
}: ProcessingStatusProps) {
  if (status === "idle") return null;

  const statusConfig = {
    processing: {
      color: "blue",
      text: message || "Processing...",
      showSpinner: true,
    },
    success: {
      color: "green",
      text: message || "Success!",
      showSpinner: false,
    },
    error: {
      color: "red",
      text: message || "An error occurred",
      showSpinner: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center gap-3 px-6 py-4 rounded-xl bg-${config.color}-50 border border-${config.color}-200`}
    >
      {config.showSpinner ? (
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div
          className={`w-5 h-5 rounded-full ${
            status === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        />
      )}
      <span
        className={`text-sm font-medium ${
          status === "processing"
            ? "text-blue-700"
            : status === "success"
            ? "text-green-700"
            : "text-red-700"
        }`}
      >
        {config.text}
      </span>
    </div>
  );
}
