# EMRM-Studio — 3D electromagnetic field analysis with CAD (trial edition)

[日本語](README.ja.md)

EMRM-Studio (Electric, Magnetic, Resonant Mode) is a Windows desktop application for designing accelerator
magnets, electron guns and RF cavities. Build the geometry in a full parametric 3D CAD, assign materials, coils and
boundary conditions, and compute **magnetostatic fields, resonant modes and port analysis (S-parameters)** in one
window.

The solvers use the finite element method: edge elements for the magnetic vector potential, and **second-order
Nédélec elements on curved tetrahedra** for resonant modes and port analysis, which give high accuracy with few
elements.

This repository hosts the **downloads and the issue tracker** of EMRM-Studio. It does not contain the source code.

> **Trial edition:** all features are available, but the number of mesh elements (tetrahedra) that can be analyzed
> is limited (**10,000** for eigenmode and port analysis, **30,000** for magnetostatics). See
> [Trial limitation](#trial-limitation).

## Features

- **3D CAD**: constrained and dimensioned sketches, extrude / revolve / sweep / loft, Booleans, fillets and chamfers,
  patterns and mirrors, parameters. STEP / IGES import and export
- **Studies**: any number of magnetostatic, eigenmode and port-analysis studies on one model
- **Magnetostatics**: iron (linear or saturating with a B-H curve), coils (conductors with a current inlet and outlet,
  toroidal coils, coils wound along a sketch profile), symmetry planes, field lines, color maps, 2D slices and
  multipole expansion
- **Resonant modes**: frequencies, fields, Q from wall and dielectric losses, R/Q, accelerating voltage, surface
  currents
- **Port analysis**: waveguide and coaxial ports, S-parameters (magnitude and phase), adaptive sweep, resonance
  search (f0, Qe, Q0, QL), fields at any frequency, Touchstone export
- **Display**: slices, arrows, color maps, field lines and 2D plots. Results are saved in the project
- Japanese and English user interface. HTML user manual included (Help -> User manual, F1; currently Japanese)

## Requirements

| | |
|---|---|
| OS | Windows 10 / 11 (64-bit) |
| Memory | 8 GB or more recommended |
| Graphics | OpenGL 3.2 or later (for the 3D view). It may not work over Remote Desktop or in some virtual machines |
| Disk | about 2 GB for the extracted folder |

No installation or administrator rights are needed.

## Download and start

1. Download `EMRM-Studio-<version>-trial-win64.zip` from [Releases](https://github.com/TakuyaNatsui/EMRM-Studio/releases).
2. (Optional) Check the file against `SHA256SUMS.txt`:
   `certutil -hashfile EMRM-Studio-<version>-trial-win64.zip SHA256`
3. Extract the zip into a local folder (for example `C:\EMRM-Studio`). Avoid folders synchronized to the cloud
   (OneDrive, Dropbox, ...) because the folder contains many files.
4. Run `EMRM-Studio.exe` in the extracted folder. Open an example (`examples\*.emrm`) with **File -> Open** to try an
   analysis right away.

The executable is **not code-signed yet**. If "Windows protected your PC" appears, check where you downloaded it from
and click **More info** -> **Run anyway**. Newly published executables are sometimes falsely flagged by antivirus
software; please let us know in [Issues](https://github.com/TakuyaNatsui/EMRM-Studio/issues).

Version: run `EMRM-Studio.exe version` in a command prompt.

## Trial limitation

| Analysis | Mesh elements that can be analyzed |
|---|---|
| Eigenmode and port analysis | up to 10,000 |
| Magnetostatics (including the air region) | up to 30,000 |

- Larger meshes can still be generated and inspected; the analysis stops with a message before solving. Use a larger
  mesh size to reduce the number of elements. The current-distribution preview is not limited.
- All other features (modeling, meshing, viewing and exporting results) are the same as in the full edition.
- There is no restriction on the purpose of use (business and commercial use are allowed).
- The [Trial License Agreement](EULA.en.md) applies (the [Japanese version](EULA.ja.md) is the governing version).

## Bundled software and source code

- EMRM-Studio itself is proprietary software (© 2026 Takuya Natsui), provided under the
  [Trial License Agreement](EULA.en.md).
- The application contains third-party open-source components (Qt / PySide6, VTK, Open CASCADE, NumPy, SciPy, h5py,
  Intel MKL, ...). Their licenses and copyright notices are in `THIRD_PARTY_NOTICES.txt` in the application folder.
  The LGPL libraries are kept as separate files and can be replaced (see `LGPL_REPLACEMENT.txt`).
- The `mesher/` folder is a separate program distributed under the **GNU GPL v2 or later**. It contains Gmsh
  (https://gmsh.info) and the meshing helper (as source code). The Gmsh source is in `mesher/src/`; the sources of the
  third-party libraries statically linked into the Gmsh DLL are in the release attachment
  `EMRM-Studio-<version>-mesher-sources.zip` (see its `README.txt`, which also contains the written offer under
  GPL v2 section 3(b)).

## Privacy

EMRM-Studio does not collect or send any usage information. Your models and results stay on your computer.

## Contact

Please report bugs, questions and requests in [Issues](https://github.com/TakuyaNatsui/EMRM-Studio/issues). For bugs,
attach the output of `EMRM-Studio.exe version`. Support for the trial edition is not guaranteed.

---

© 2026 Takuya Natsui. All rights reserved (except for the third-party components; see above).
