"use client";

export default function NetworkButton(props: any) {
  return (
    <button onClick={() => fetch("/notReal")} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
      {props.label}
    </button>
  );
}