"use client";

import { useState } from "react";

export default function ErrorButton(props: any) {
  const [raiseError, setRaiseError] = useState(false);

  if (raiseError) {
    // "a" is undefined so "props.a.b" will result in an error
    return props.a.b;
  } else {
    return (
      <button onClick={() => setRaiseError((error) => !error)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        {props.label}
      </button>
    );
  }
}