from synthesis.server.app import create_app


def main() -> None:
    import uvicorn
    from synthesis.config import SynthesisSettings

    settings = SynthesisSettings()
    app = create_app(settings)
    uvicorn.run(app, host=settings.server_host, port=settings.server_port)
