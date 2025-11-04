import React, { useState } from "react";
import KundliGrid3x3 from "@/features/dashboard/components/KundliGrid3x3";

type Gender = "" | "male" | "female" | "other";

export default function NumerologyPage() {
  const [name, setName]   = useState<string>("");
  const [gender, setGender] = useState<Gender>("");
  const [dob, setDob]     = useState<string>("");

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Show captured info anywhere you like */}
      <div className="text-sm opacity-80">
        {name && <>Name: <b>{name}</b> · </>}
        {gender && <>Gender: <b>{gender}</b> · </>}
        {dob && <>DOB: <b>{dob}</b></>}
      </div>

      <KundliGrid3x3
        dob={dob}
        showPlanes={true}
        lang="en"
        name={name}
        gender={gender}
        onChangeName={setName}
        onChangeGender={setGender}
        onChangeDob={setDob}     // ⬅️ connected
        onSave={() => {/* persist */}}
        onPdf={() => {/* export */}}
        onSpeak={() => {/* TTS */}}
      />
    </div>
  );
}
