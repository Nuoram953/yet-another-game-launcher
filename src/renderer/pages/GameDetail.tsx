import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GameDetail = () => {
  const [game, setGame] = useState()
  const { id } = useParams();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const result = await window.database.getGame(id);
        console.log(result)
        if(result){
          setGame(result);
        }
        
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, []);

  const handleOnClick = async ()=>{
    await window.steam.run(game.externalId);
  }

  return (
    <div>
      <p>{id}</p>
      <Button onClick={handleOnClick}/>
    </div>
  );
};

export default GameDetail;
