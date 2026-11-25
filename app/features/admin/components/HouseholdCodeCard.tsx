"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff, Share2 } from "lucide-react";
import Button from "@/app/components/Button";
import { inviteText, shareInvite } from "../utils/shareInvite";

// The household code, hidden until "Vis", and an invite to send to the household.
export default function HouseholdCodeCard({ code }: { code: string }) {
  const [shown, setShown] = useState(false);
  const view = shown
    ? { label: "Skjul", Icon: EyeOff, text: code }
    : { label: "Vis", Icon: Eye, text: "••••••••" };

  // Called straight from the tap: shareInvite must reach navigator.share before any await (iOS).
  const share = () =>
    shareInvite(inviteText(window.location.origin, code), navigator).then(
      (result) => {
        if (result === "copied") toast.success("Invitationen er kopieret");
      },
      () => {
        toast.error("Kunne ikke dele invitationen");
      },
    );

  return (
    <section className="mb-10 max-w-md rounded-2xl bg-surface p-card shadow-raised">
      <h2 className="text-section-title">Husstandskode</h2>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Send koden til dem i husstanden, så de kan logge ind.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="flex-1 break-all rounded-lg bg-background px-3 py-2 font-mono text-body">
          {view.text}
        </span>
        <Button variant="secondary" size="md" onClick={() => setShown(!shown)}>
          <view.Icon className="h-4 w-4" aria-hidden="true" />
          {view.label}
        </Button>
      </div>
      <Button className="mt-3" fullWidth onClick={share}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Del invitation
      </Button>
    </section>
  );
}
