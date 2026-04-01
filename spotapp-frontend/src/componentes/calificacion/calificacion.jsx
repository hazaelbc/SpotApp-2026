import React, { useEffect, useState } from 'react';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';

const Calificacion = ({ valorInicial = 0, onCalificar, readOnly = false }) => {
  const [valor, setValor] = useState(Number(valorInicial) || 0);
  const [hover, setHover] = useState(-1);

  useEffect(() => {
    const next = Number(valorInicial);
    setValor(Number.isFinite(next) ? next : 0);
  }, [valorInicial]);

  const handleChange = (event, newValue) => {
    if (readOnly) return;
    setValor(newValue);
    if (onCalificar) onCalificar(newValue);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ alignItems: 'center' }}>
      <Rating
        name="calificacion-premium"
        precision={0.5}
        value={valor}
        onChange={handleChange}
        max={5}
        readOnly={readOnly}
        onChangeActive={(e, newHover) => setHover(newHover)}
        sx={{
          '& .MuiRating-icon': {
            transition: 'transform 140ms ease, color 140ms ease',
            color: 'rgba(255, 193, 7, 0.9)'
          },
          '& .MuiRating-iconHover': {
            transform: 'scale(1.08)'
          },
          '&:hover .MuiRating-icon': {
            transform: 'scale(1.06)'
          },
          // subtle glow when hovering over a star value
          '& .MuiRating-iconFilled': {
            filter: hover > 0 ? 'drop-shadow(0 2px 6px rgba(255,170,0,0.12))' : 'none'
          }
        }}
        icon={<span style={{ fontSize: 26 }}>★</span>}
        emptyIcon={<span style={{ fontSize: 26 }}>☆</span>}
      />
    </Stack>
  );
};

export default Calificacion;