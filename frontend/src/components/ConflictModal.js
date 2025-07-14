import React from 'react';

const ConflictModal = ({ clientVersion, serverVersion, onResolve, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>⚠️ Conflict Detected</h3>
        <p>The task was modified by another user.</p>

        <div className="conflict-columns">
          <div>
            <h4>Your Version</h4>
            <pre>{JSON.stringify(clientVersion, null, 2)}</pre>
          </div>
          <div>
            <h4>Server Version</h4>
            <pre>{JSON.stringify(serverVersion, null, 2)}</pre>
          </div>
        </div>

        <div className="modal-buttons">
          <button onClick={() => onResolve(clientVersion)}>Overwrite</button>
          <button onClick={() => onResolve(serverVersion)}>Use Server</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
