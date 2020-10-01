import './round-start.scss';

import React from 'react';
import Button from './button';

const RoundStart = ({ competing, fight, onImage, image }) => (
  <div className="round-start-container">
    <div className="round-header">
      <p className="headline3 round-title">Round {fight.currentRound || '?'}</p>
      {/* <p className="headline5">Round Length: {parseInt(fight.roundDuration) / 60} minutes</p> */}
      <p className={`headline5 ${fight.roundDone ? 'flashing' : ''}`}>
        Time Left: {`${(parseInt(fight.stateTimeLeft || 0) / 60).toFixed(0)}`.padStart(2, '0')}:
        {`${(parseInt(fight.stateTimeLeft || 0) % 60).toFixed(0)}`.padStart(2, '0')}
      </p>
    </div>
    <div className="round-body">
      {!fight.roundDone && (
        <p className="headline5 ready-prompt">
          {competing ? 'Submit an image for the round' : 'Waiting for competitors to submit their images...'}
        </p>
      )}
      {!fight.roundDone && (
        <div className="form-group form-group-fluid">
          <input type="file" id="image" onChange={onImage} />
          <label htmlFor="image" className="body2">
            {image ? `${image.name} (${(image.size / 1000000).toFixed(1)}mb)` : 'Choose an image (2mb max)'}
          </label>
        </div>
      )}
      {fight.roundDone && <p className="headline4">Tying up all the loose ends...</p>}
    </div>
  </div>
);

export default RoundStart;
