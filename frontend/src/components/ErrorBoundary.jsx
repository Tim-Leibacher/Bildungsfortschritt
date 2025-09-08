class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-error">
          <h2>Etwas ist schiefgelaufen.</h2>
        </div>
      );
    }

    return this.props.children;
  }
}
