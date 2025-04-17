import React, { useState, useEffect } from "react";
import { Image } from "../../components/image/Image";

interface RankingCoverProps {
  id: string;
}

export const RankingCover = ({ id }: RankingCoverProps) => {
  const [coverPicture, setCoverPicture] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const cover = await window.media.getCovers(id, 1);
        setCoverPicture(cover[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return <Image src={coverPicture} alt={id} className="object-cover h-full"/>;
};
