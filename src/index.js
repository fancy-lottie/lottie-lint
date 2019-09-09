
import LottieLint from './LottieLint';

function lottieLint(jsonData) {
  const lottieLint = new LottieLint(jsonData);
  return lottieLint.getResult();
}

lottieLint.LottieLint = LottieLint;
export default lottieLint;
