import '@testing-library/jest-dom';

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={typeof href === 'string' ? href : href?.pathname ?? '#'} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('next/image', () => {
  return function MockImage(props) {
    // Mimic Next Image with a regular img so DOM assertions stay simple.
    return <img {...props} alt={props.alt ?? ''} />;
  };
});

jest.mock('next/navigation', () => {
  const router = {
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  return {
    useRouter: () => router,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  };
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.scrollTo = jest.fn();
