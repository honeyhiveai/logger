from setuptools import setup, find_packages

setup(
    name="honeyhive-logger",
    version="..1",
    packages=find_packages(),
    install_requires=[
        "requests>=2.31.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "twine>=4.0.0",
        ],
    },
    author="HoneyHive",
    author_email="support@honeyhive.ai",
    description="A Python logger for HoneyHive",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/honeyhive-ai/honeyhive-logger",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
) 