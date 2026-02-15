import { determineMonitorGroup } from './monitor-group.policy';

describe('determineMonitorGroup', () => {
  it('should return manual mapped group when exact monitor name exists', () => {
    expect(determineMonitorGroup('nangman.cloud')).toBe('Applications');
  });

  it('should classify by pattern when no manual mapping exists', () => {
    expect(determineMonitorGroup('unknown-grafana-node')).toBe(
      'Platform Services',
    );
    expect(determineMonitorGroup('new-router-01')).toBe('Network Layer');
  });
});
