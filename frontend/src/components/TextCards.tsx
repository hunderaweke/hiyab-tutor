import React from "react";
const TextCards = ({
  text = "We’ve used Hiyab Tutors for over a year now for both our children. The tutors are always respectful, punctual, and genuinely invested in helping the kids grow. What I appreciate most is how they adapt their teaching methods to fit each child’s pace. Hiyab Tutors has become a part of our family’s academic life, and we’re so grateful.",
  name = "Hundera Awoke",
  role = "Student",
}) => {
  return (
    <div className="text-card p-5 border-2 border-brand-green rounded-md h-full grid grid-rows-[1fr_auto] gap-4 bg-main/40">
      <p className="text-card__content overflow-hidden">{text}</p>
      <div className="text-brand-green flex items-center justify-between gap-4">
        <p>{name}</p>
        <p>{role}</p>
      </div>
    </div>
  );
};

export default TextCards;
