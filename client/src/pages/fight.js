import './fight.scss';

import React from 'react';
import Nav from '../components/nav';
import UserContext from '../user-context';
import Card from '../components/card';
import Button from '../components/button';
import User from '../assets/user.png';

export default class Fight extends React.Component {
  static contextType = UserContext;

  constructor(props) {
    super(props);

    const { params } = props.match;
    this.state = {
      action: params.action || 'new',
      fightId: params.id,
      fight: {
        name: '',
        description: '',
        competitorCount: 2,
        roundDuration: 15,
        roundCount: 3,
      },
      showViewers: true,
    };

    this.onFightName = this.onFightName.bind(this);
    this.onCompetitorCount = this.onCompetitorCount.bind(this);
    this.onRoundDuration = this.onRoundDuration.bind(this);
    this.onRoundCount = this.onRoundCount.bind(this);
  }

  componentDidMount() {
    const { action } = this.state;
    if (action === 'view') {
      // TODO: Add socket code to connect viewer
    }
    if (action === 'compete') {
      // TODO: Add socket code to connect competitor
    }
  }

  onFightName(e) {
    const { fight } = this.state,
      { value } = e.target;
    fight.name = value;
    this.setState({ fight: { ...fight } });
  }

  onCompetitorCount(e) {
    const { fight } = this.state,
      { value } = e.target;
    fight.competitorCount = parseInt(value);
    this.setState({ fight: { ...fight } });
  }

  onRoundDuration(e) {
    const { fight } = this.state,
      { value } = e.target;
    fight.roundDuration = parseInt(value);
    this.setState({ fight: { ...fight } });
  }

  onRoundCount(e) {
    const { fight } = this.state,
      { value } = e.target;
    fight.roundCount = parseInt(value);
    this.setState({ fight: { ...fight } });
  }

  render() {
    const { action, fight, showViewers } = this.state;
    const user = this.context;
    return (
      <div className="fight-container">
        <Nav variant="solid" />
        {action === 'new' && (
          <div className="new-modal-container">
            <Card className="new-modal">
              <i className="fa fa-times" />
              <p className="headline5">New Fight</p>
              <form className="form-fluid">
                <div className="form-group">
                  <label htmlFor="fightName" className="headline6">
                    Fight Name
                  </label>
                  <input
                    type="text"
                    className="surface-24-flat"
                    placeholder="Name"
                    onChange={this.onFightName}
                    value={fight.name}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fightName" className="headline6">
                    Competitor Count
                  </label>
                  <input
                    type="number"
                    className="surface-24-flat"
                    placeholder="Name"
                    onChange={this.onCompetitorCount}
                    value={fight.competitorCount}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fightName" className="headline6">
                    Round Duration
                  </label>
                  <select className="surface-24-flat" onChange={this.onRoundDuration} value={fight.roundDuration}>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="fightName" className="headline6">
                    Round Count
                  </label>
                  <select className="surface-24-flat" onChange={this.onRoundCount} value={fight.roundCount}>
                    <option value="3">3 rounds</option>
                    <option value="5">5 rounds</option>
                    <option value="7">7 rounds</option>
                  </select>
                </div>
                <div className="buttons">
                  <Button onClick={() => console.log("it's working")}>Create</Button>
                  <Button variant="text">Cancel</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
        {(action === 'compete' || action === 'view') && (
          <div className={`${action}-container`}>
            <div className="fight-title surface-1-flat">
              <p className="headline6">{fight.name || 'Unitled Fight'}</p>
            </div>
            <div className="main">
              {showViewers && (
                <div className="viewers-container surface-1-flat">
                  <div className="viewers-title">
                    <span className="caps">viewers:</span>
                    <span className="viewer-count">10k</span>
                  </div>
                  <div className="viewer-list">
                    <div className="viewer">
                      <img src={User} className="viewer-pfp" alt="Viewer" />
                      <p className="viewer-name">BradHacker</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
