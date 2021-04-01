import { kafkaLite } from './kafka-lite';

describe('kafkaLite', () => {
  it('should work', () => {
    expect(kafkaLite()).toEqual('kafka-lite');
  });
});
