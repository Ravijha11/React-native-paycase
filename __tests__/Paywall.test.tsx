import React from 'react';
import { render } from '@testing-library/react-native';
import PaywallScreen from '../app/paywall';
import renderer from 'react-test-renderer';

// Mock the SubscriptionContext
jest.mock('../app/context/SubscriptionContext', () => ({
  useSubscription: jest.fn().mockReturnValue({
    packages: [
      {
        identifier: 'monthly',
        product: {
          title: 'Monthly Pro',
          priceString: '$9.99',
          description: 'Monthly subscription',
        },
      },
      {
        identifier: 'yearly',
        product: {
          title: 'Yearly Pro',
          priceString: '$99.99',
          description: 'Yearly subscription (save 17%)',
        },
      },
    ],
    isLoading: false,
    purchase: jest.fn(),
    restore: jest.fn(),
    isPro: false,
  }),
}));

describe('PaywallScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText('Choose a Subscription Plan')).toBeTruthy();
    expect(getByText('Monthly Pro')).toBeTruthy();
    expect(getByText('$9.99')).toBeTruthy();
    expect(getByText('Yearly Pro')).toBeTruthy();
    expect(getByText('$99.99')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<PaywallScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders loading state correctly', () => {
    // Override the mock for this test
    jest.mock('../app/context/SubscriptionContext', () => ({
      useSubscription: jest.fn().mockReturnValue({
        packages: [],
        isLoading: true,
        purchase: jest.fn(),
        restore: jest.fn(),
        isPro: false,
      }),
    }));

    const { getByText } = render(<PaywallScreen />);
    expect(getByText('Loading packages...')).toBeTruthy();
  });

  it('renders pro user state correctly', () => {
    // Override the mock for this test
    jest.mock('../app/context/SubscriptionContext', () => ({
      useSubscription: jest.fn().mockReturnValue({
        packages: [],
        isLoading: false,
        purchase: jest.fn(),
        restore: jest.fn(),
        isPro: true,
      }),
    }));

    const { getByText } = render(<PaywallScreen />);
    expect(getByText('You are already subscribed!')).toBeTruthy();
  });
});