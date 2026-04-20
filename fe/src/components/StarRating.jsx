import { useState } from "react";

import { HiStar, HiOutlineStar } from "react-icons/hi2";

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem'
};

const starContainerStyle = {
  display: 'flex',
}

export default function StarRating({ maxRating = 5, color = '#fcc419', size = 36, className = '', messages = [], defaultRating = 0, onSetRating = null, }) {
  const [rating, setRating] = useState(defaultRating)
  const [tempRating, setTempRating] = useState(0)

  function handleRating(rating) {
    setRating(rating);
    if (onSetRating) onSetRating(rating)
  }
  size = size / 16 // conversion to rem

  const textStyle = {
    lineHeight: '1',
    margin: 0,
    color,
    fontSize: `${size * 0.6}rem`
  }

  return (
    <div style={containerStyle} className={className}>
      <div style={starContainerStyle}>
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            onRate={() => handleRating(i + 1)}
            full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
            onHoverIn={() => setTempRating(i + 1)}
            onHoverOut={() => setTempRating(0)}
            color={color}
            size={size}
          />
        ))}
      </div>
      <p style={textStyle}> {messages.length === maxRating ? messages[tempRating ? tempRating - 1 : rating - 1] : tempRating || rating || ' '} </p>
    </div>
  );
};



function Star({ onRate, full, onHoverIn, onHoverOut, color, size }) {
  const starStyle = {
    width: `${size}rem`,
    height: `${size}rem`,
    display: 'block',
    cursor: 'pointer'
  }
  return (
    <span role="button" style={starStyle} onClick={onRate} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}>
      {full ? (
        <HiStar size={`${size}rem`} color={color} />
      ) : (
        <HiOutlineStar size={`${size}rem`} color={color} />
      )}
    </span>
  )
}