"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { FeedbackModal } from "@/components/FeedbackModal";

export function FeedbackButton() {
  const t = useT();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
      >
        {t.feedback.button}
      </button>

      {showModal && <FeedbackModal onClose={() => setShowModal(false)} />}
    </>
  );
}
