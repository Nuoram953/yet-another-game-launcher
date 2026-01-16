import React from "react";
import { YourReviewThoughts } from "./components/YourReviewThoughts";
import { CriticReviews } from "./components/CriticReview";
import { UserReviews } from "./components/UserReview";
import { YourReview } from "./components/YourReview";

export const DetailsReviews = () => {
  return (
    <div className="space-y-10">
      <YourReviewThoughts />
      <YourReview />
      <CriticReviews />
      <UserReviews />
    </div>
  );
};
