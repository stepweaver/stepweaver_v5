import { validateWorld } from '../utils/validateWorld';

describe('validateWorld', () => {
  it('reports no issues for the bundled world graph', () => {
    const issues = validateWorld();
    expect(issues).toEqual([]);
  });
});
